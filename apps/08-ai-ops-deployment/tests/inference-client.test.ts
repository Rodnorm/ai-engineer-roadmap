import test from "node:test";
import assert from "node:assert/strict";
import { AzureOpenAI, OpenAI } from "openai";
import { InferenceClient } from "../lib/models/inference-client";

test("InferenceClient.createClient uses AzureOpenAI for classic endpoints", () => {
  const classicEndpoint = "https://my-resource.openai.azure.com/";
  const client = InferenceClient.createClient(classicEndpoint, "dummy-key", "2024-10-21");

  assert.ok(client instanceof AzureOpenAI, "Expected client to be an instance of AzureOpenAI");
});

test("InferenceClient.createClient uses OpenAI for OpenAI v1 compatible endpoints", () => {
  const foundryEndpoint = "https://my-resource.services.ai.azure.com/openai/v1";
  const client = InferenceClient.createClient(foundryEndpoint, "dummy-key");

  assert.ok(client instanceof OpenAI, "Expected client to be an instance of OpenAI");
  assert.ok(
    !(client instanceof AzureOpenAI),
    "Expected client NOT to be an instance of AzureOpenAI for OpenAI v1 endpoint"
  );
  assert.equal(client.baseURL, "https://my-resource.services.ai.azure.com/openai/v1");
});

test("InferenceClient offline simulation honors requested model in telemetry", async () => {
  const result = await InferenceClient.execute({
    prompt: "Hello world",
    model: "candidate-gpt-4o-custom",
    target: "green",
  });

  assert.equal(result.model, "candidate-gpt-4o-custom");
  assert.equal(result.target, "green");
});
