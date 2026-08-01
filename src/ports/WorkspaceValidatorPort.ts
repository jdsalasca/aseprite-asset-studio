export interface WorkspaceValidatorPort<TConfig> {
  validate(config: TConfig): Promise<string | undefined>;
}
