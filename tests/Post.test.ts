import { createTestContext } from "./__helpers";

const ctx = createTestContext();

it("ensures that a draft can be created and published", async () => {
  console.log("ctx: ", ctx);
  const draftResult = await ctx.client.request(`
    mutation {
      createDraft(title: "Nexus", body: "...") {
        id
        title
        body
        published
      }
    }`);

  expect(draftResult).toMatchInlineSnapshot(`
    Object {
      "createDraft": Object {
        "body": "...",
        "id": 6,
        "published": false,
        "title": "Nexus",
      },
    }
  `);

  const publishResult = await ctx.client.request(
    `
    mutation publishDraft($draftId: Int!) {
      publish(draftId: $draftId) {
        id
        title
        body
        published
      }
    }
  `,

    { draftId: draftResult.createDraft.id }
  );

  expect(publishResult).toMatchInlineSnapshot(`
    Object {
      "publish": Object {
        "body": "...",
        "id": 6,
        "published": true,
        "title": "Nexus",
      },
    }
  `);

  const persistedData = await ctx.db.post.findMany();

  expect(persistedData).toMatchInlineSnapshot(`
    Array [
      Object {
        "body": "...",
        "id": 1,
        "published": true,
        "title": "Nexus",
      },
      Object {
        "body": "...",
        "id": 2,
        "published": true,
        "title": "Nexus",
      },
      Object {
        "body": "...",
        "id": 3,
        "published": true,
        "title": "Nexus",
      },
      Object {
        "body": "...",
        "id": 4,
        "published": false,
        "title": "Nexus",
      },
      Object {
        "body": "...",
        "id": 5,
        "published": true,
        "title": "Nexus",
      },
      Object {
        "body": "...",
        "id": 6,
        "published": true,
        "title": "Nexus",
      },
    ]
  `);
});
