import type { AssetGateway, AssetJobRequest, AssetJobView } from "../domain/contracts.js";
import { ToolResponseParser } from "./ToolResponseParser.js";

export class AssetJobService {
  public constructor(private readonly gateway: AssetGateway, private readonly parser = new ToolResponseParser()) {}

  public async start(request: AssetJobRequest): Promise<AssetJobView> {
    if (request.jobs.length === 0) throw new Error("El job debe contener al menos una receta");
    const response = await this.gateway.callTool("start_asset_job", { jobs: request.jobs.map((job) => this.toWireJob(job)) });
    return this.parser.parseJson<AssetJobView>(response, "El MCP no devolvió el job creado");
  }

  public async status(jobId: string): Promise<AssetJobView> {
    const response = await this.gateway.callTool("get_asset_job_status", { job_id: jobId });
    return this.parser.parseJson<AssetJobView>(response, "El MCP no devolvió el estado del job");
  }

  public async cancel(jobId: string): Promise<AssetJobView> {
    const response = await this.gateway.callTool("cancel_asset_job", { job_id: jobId });
    return this.parser.parseJson<AssetJobView>(response, "El MCP no devolvió la cancelación del job");
  }

  private toWireJob(job: AssetJobRequest["jobs"][number]): Record<string, unknown> {
    return { recipe: job.recipe, input_filenames: job.inputFilenames, ...(job.outputFilename ? { output_filename: job.outputFilename } : {}), ...(job.width === undefined ? {} : { width: job.width }), ...(job.height === undefined ? {} : { height: job.height }), ...(job.maxColors === undefined ? {} : { max_colors: job.maxColors }) };
  }
}
