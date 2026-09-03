import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/** Minimal TipTap document JSON from an array of paragraph strings. */
function doc(...paragraphs: string[]) {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: text ? [{ type: "text", text }] : [],
    })),
  };
}

async function main() {
  const users = [
    { email: "alice@example.com", name: "Alice Johnson" },
    { email: "bob@example.com", name: "Bob Martinez" },
    { email: "carol@example.com", name: "Carol Chen" },
  ];

  const [alice, bob, carol] = await Promise.all(
    users.map((u) =>
      db.user.upsert({ where: { email: u.email }, update: {}, create: u }),
    ),
  );

  // Re-seeding should be idempotent, so clear demo documents first.
  await db.document.deleteMany({
    where: { ownerId: { in: [alice.id, bob.id, carol.id] } },
  });

  const roadmap = await db.document.create({
    data: {
      title: "Q3 Product Roadmap",
      ownerId: alice.id,
      content: doc(
        "This document is owned by Alice and shared with Bob as an editor.",
        "Bob can open it from 'Shared with me' and change this text.",
      ),
      shares: { create: [{ userId: bob.id, role: "EDITOR" }] },
    },
  });

  await db.document.create({
    data: {
      title: "Engineering Handbook",
      ownerId: alice.id,
      content: doc(
        "Alice owns this one and shared it with Carol as a viewer.",
        "Carol can read it but the editor stays read-only for her.",
      ),
      shares: { create: [{ userId: carol.id, role: "VIEWER" }] },
    },
  });

  await db.document.create({
    data: {
      title: "Bob's Private Notes",
      ownerId: bob.id,
      content: doc("Only Bob can see this document. It is shared with nobody."),
    },
  });

  console.log("Seeded 3 users and 3 documents.");
  console.log(`  Alice (${alice.email}) owns "${roadmap.title}" + 1 more`);
  console.log(`  Bob   (${bob.email}) is an EDITOR on "${roadmap.title}"`);
  console.log(`  Carol (${carol.email}) is a VIEWER on "Engineering Handbook"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
