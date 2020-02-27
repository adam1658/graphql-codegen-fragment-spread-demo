import {
  DocumentNode,
  DefinitionNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
  ExecutableDefinitionNode
} from "graphql";
import {
  CFieldsFragmentDoc,
  BFieldsFragmentDoc,
  AFieldsFragmentDoc,
  TestDocument
} from "./src/TestQuery.generated";

const isOperationDef = (def: DefinitionNode): def is OperationDefinitionNode =>
  def.kind === "OperationDefinition";
const isFragmentDef = (def: DefinitionNode): def is FragmentDefinitionNode =>
  def.kind === "FragmentDefinition";
const isExecutableDef = (
  def: DefinitionNode
): def is ExecutableDefinitionNode => isOperationDef(def) || isFragmentDef(def);

function getDefinitions(document: DocumentNode) {
  return document.definitions
    .filter(isExecutableDef)
    .map(def => def.name!.value);
}

function getUsedFragments(document: DocumentNode) {
  return Array.from(
    JSON.stringify(document).matchAll(
      /"kind":"FragmentSpread","name":{"kind":"Name","value":"([A-Za-z]*)"}/g
    )
  ).map(result => result[1]);
}

function check(entrypoint: string, doc: DocumentNode) {
  const usedFragments = getUsedFragments(doc);
  const definedFragments = getDefinitions(doc).filter(
    name => name !== entrypoint
  );
  return {
    entrypoint,
    usedFragments,
    definedFragments
  };
}

console.table([
    check("CFields", CFieldsFragmentDoc),
    check("BFields", BFieldsFragmentDoc),
    check("AFields", AFieldsFragmentDoc),
    check("Test", TestDocument),
]);
