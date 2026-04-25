export interface Notifier {
  info(event: string, payload: Record<string, unknown>): Promise<void>;
  error(event: string, payload: Record<string, unknown>): Promise<void>;
}
