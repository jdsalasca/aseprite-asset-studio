export interface ConfigStorePort<TConfig> {
  load(fallback: TConfig): Promise<TConfig>;
  save(config: TConfig): Promise<void>;
}
