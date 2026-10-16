export type CredentialKind = "session" | "api_key" | "oauth" | "service" | "system";

export interface Principal {
  userId: string;
  credentialKind: CredentialKind;
  /** null means the identity mechanism itself does not scope application permissions (web session). */
  scopes: ReadonlySet<string> | null;
}
