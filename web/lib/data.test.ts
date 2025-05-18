import { test } from "@jest/globals";
import { expect } from "@jest/globals";
import { query } from "./data";

test("should run a simple SQL query", async () => {
    const [rows] = await query("SELECT Count(*) as result from users");
    expect(rows).toEqual({ result: BigInt(7) });
});
