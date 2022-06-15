import { Knex as KnexType } from "knex";

export async function seed(knex: KnexType): Promise<void> {
    // Deletes ALL existing entries
    await knex("record").del();
    await knex("screenshots").del();
    // Inserts seed entries
    await knex("record").insert([
        { name: "alex", score: 0 },
        { name: "gordon", score: 0 },
        { name: "michael", score: 0 },
        { name: "jason", score: 0 },
        { name: "beeno", score: 0 },
        { name: "dennis", score: 0 },
        { name: "reemo", score: 0 },
        { name: "andrew", score: 0 },
        { name: "fung", score: 0 },
        { name: "ken", score: 0 },
        { name: "neo", score: 0 },
        { name: "zero", score: 0 },
    ]);
};
