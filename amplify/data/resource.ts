import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
//import { validatePromo } from "../functions/validatePromo/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update",
and "delete" any "Todo" records.
=========================================================================*/
const schema = a
  .schema({
    StoreHours: a.customType({
      monday: a.ref("DayHours"),
      tuesday: a.ref("DayHours"),
      wednesday: a.ref("DayHours"),
      thursday: a.ref("DayHours"),
      friday: a.ref("DayHours"),
      saturday: a.ref("DayHours"),
      sunday: a.ref("DayHours"),
    }),
    DayHours: a.customType({
      open: a.string(),
      close: a.string(),
    }),
    PhonePeAuthResponse: a.customType({
      success: a.boolean(),
      access_token: a.string(),
      expires_in: a.float(),
      statusCode: a.integer(),
      error: a.string(),
    }),
    PromoCodeResult: a.customType({
      valid: a.boolean().required(),
      reason: a.string().required(),
      code: a.string(),
      productId: a.id(),
      discountAmount: a.float(),
    }),
    Todo: a
      .model({
        name: a.string(),
        description: a.string(),
        isDone: a.boolean(),
      })
      .authorization((allow) => [allow.owner()]),
    Stores: a
      .model({
        name: a.string(),
        address: a.string(),
        latitude: a.float(),
        longitude: a.float(),
        phone: a.string(),
        city: a.string(),
        state: a.string(),
        zip: a.string(),
        inventory: a.hasMany("StoreProduct", "storeID"),
        hours: a.ref("StoreHours"),
      })
      .authorization((allow) => [allow.authenticated()]),
    Product: a
      .model({
        name: a.string().required(),
        description: a.string(),
        price: a.float().required(),
        imageUrl: a.string(),
        category: a.string(),
        available: a.boolean().default(true),
        rewardInterval: a.integer().required().default(10),
        /** Remove storeID here */
        /** A product can now exist in multiple stores */
        stores: a.hasMany("StoreProduct", "productID"),
        orderItems: a.hasMany("OrderItem", "productID"),
      })
      .authorization((allow) => [allow.authenticated()]),
    StoreProduct: a
      .model({
        storeID: a.id().required(),
        store: a.belongsTo("Stores", "storeID"),
        productID: a.id().required(),
        product: a.belongsTo("Product", "productID"),
        /** Quantity per store */
        quantity: a.integer().required().default(0),
        /** Optional fields */
        priceOverride: a.float(), // store-specific pricing
        isAvailable: a.boolean().default(true), // store-level availability
      })
      .authorization((allow) => [allow.authenticated()]),

    Order: a
      .model({
        orderNumber: a.string().required(),
        totalAmount: a.float().required(),
        trackingNumber: a.string(),
        status: a.enum([
          "Pending",
          "Confirmed",
          "Paid",
          "Preparing",
          "Completed",
          "Cancelled",
        ]),
        createdAt: a.datetime(),
        // Relationship: One Order → many OrderItems
        items: a.hasMany("OrderItem", "orderID"),
        // Automatically linked to the authenticated user
        owner: a.string(),
      })
      .authorization((allow) => [allow.authenticated()]),
    OrderItem: a
      .model({
        orderID: a.id().required(),
        order: a.belongsTo("Order", "orderID"),
        productID: a.id().required(),
        product: a.belongsTo("Product", "productID"),
        productName: a.string().required(),
        mealName: a.string(),
        quantity: a.integer().default(1),
        price: a.float().required(),
        owner: a.string(),
      })
      .authorization((allow) => [allow.authenticated()]),
    PromoCode: a
      .model({
        code: a.string().required(),
        productID: a.id().required(),
        productName: a.string(),
        isRedeemed: a.boolean().default(false),
        owner: a.string().required(), // cognito:username
        used: a.boolean().default(false),
        expiryDate: a.datetime(),
        createdAt: a.datetime(),
      })
      .authorization((allow) => [allow.authenticated(), allow.guest()]),
    RewardProgress: a
      .model({
        productID: a.id().required(), // which product
        owner: a.string().required(), // which user (Cognito username)
        purchaseCount: a.integer().default(0),
        rewardsEarned: a.integer().default(0),
        lastUpdated: a.datetime(),
      })
      .authorization((allow) => [allow.owner()]),
  })
  .authorization((allow) => [allow.publicApiKey()]);
export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
