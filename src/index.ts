import DurableObjectDefinition from "./DurableObject";
import WorkerDefinition from "./Worker";

// Main worker is exported as default
export default WorkerDefinition;

// Any durable object definitions are exported as named exports,
// and their names are registered during deployment
export const DurableObject = DurableObjectDefinition;

