import { Knex as KnexType } from "knex";

export async function seed(knex: KnexType): Promise<void> {
    // Deletes ALL existing entries
    await knex("record").del();
    await knex("screenshots").del();
    // Inserts seed entries
    await knex("record").insert([
        { id: 1, name: "alex", score: 0 },
        { id: 2, name: "gordon", score: 0 },
        { id: 3, name: "michael", score: 0 },
        { id: 4, name: "jason", score: 0 },
        { id: 5, name: "beeno", score: 0 },
        { id: 6, name: "dennis", score: 0 },
        { id: 7, name: "reemo", score: 0 },
        { id: 8, name: "andrew", score: 0 },
        { id: 9, name: "fung", score: 0 },
        { id: 10, name: "ken", score: 0 },
        { id: 11, name: "neo", score: 0 },
        { id: 12, name: "zero", score: 0 },
    ]);
};
