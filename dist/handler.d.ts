import type { HTTPProcessResult, ProcessSettleResultResponse, x402HTTPResourceServer } from "@x402/core/server";
import type { PaymentPayload, PaymentRequirements } from "@x402/core/types";
import type { RequestAdapter } from "./types";
import type { WorkerCore } from "./index";
export declare function handlePaymentRequest(core: WorkerCore, httpServer: x402HTTPResourceServer, adapter: RequestAdapter): Promise<HTTPProcessResult>;
export declare function handleSettlement(core: WorkerCore, httpServer: x402HTTPResourceServer, adapter: RequestAdapter, paymentPayload: PaymentPayload, paymentRequirements: PaymentRequirements, upstreamStatusCode: number): Promise<ProcessSettleResultResponse>;
export declare function handleWebhookRequest(core: WorkerCore, adapter: RequestAdapter, body: string): Promise<{
    status: number;
    body: string;
}>;
//# sourceMappingURL=handler.d.ts.map