export type FlowNodeStatus = "success" | "failure" | "running";

export type FlowNodeResult<TDecision> = {
  status: FlowNodeStatus;
  decision?: TDecision;
};

export type FlowBehaviourNode<TContext, TDecision> = {
  id: string;
  evaluate: (context: TContext) => FlowNodeResult<TDecision>;
};

export function condition<TContext, TDecision>(
  id: string,
  predicate: (context: TContext) => boolean,
): FlowBehaviourNode<TContext, TDecision> {
  return {
    id,
    evaluate: (context) => ({ status: predicate(context) ? "success" : "failure" }),
  };
}

export function action<TContext, TDecision>(
  id: string,
  run: (context: TContext) => TDecision | null,
): FlowBehaviourNode<TContext, TDecision> {
  return {
    id,
    evaluate: (context) => {
      const decision = run(context);
      return decision ? { status: "success", decision } : { status: "failure" };
    },
  };
}

export function sequence<TContext, TDecision>(
  id: string,
  ...children: FlowBehaviourNode<TContext, TDecision>[]
): FlowBehaviourNode<TContext, TDecision> {
  return {
    id,
    evaluate: (context) => {
      for (const child of children) {
        const result = child.evaluate(context);
        if (result.status !== "success") return result;
        if (result.decision) return result;
      }
      return { status: "success" };
    },
  };
}

export function selector<TContext, TDecision>(
  id: string,
  ...children: FlowBehaviourNode<TContext, TDecision>[]
): FlowBehaviourNode<TContext, TDecision> {
  return {
    id,
    evaluate: (context) => {
      for (const child of children) {
        const result = child.evaluate(context);
        if (result.status === "running" || result.decision) return result;
      }
      return { status: "failure" };
    },
  };
}
