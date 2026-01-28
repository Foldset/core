import type { RequestAdapter, EventPayload, ErrorReporter } from "./types";
export declare function buildEventPayload(adapter: RequestAdapter, statusCode: number, paymentResponse?: string): EventPayload;
export declare function sendEvent(apiKey: string, payload: EventPayload, errorReporter: ErrorReporter): Promise<void>;
//# sourceMappingURL=telemetry.d.ts.map