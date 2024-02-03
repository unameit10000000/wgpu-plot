import triangleVertWGSL from './shaders/triangle.vert.wgsl?raw';
import redFragWGSL from './shaders/red.frag.wgsl?raw';

class Renderer {

  private context!: GPUCanvasContext;
  private device!: GPUDevice;
  private pipeline!: GPURenderPipeline;
 
  constructor() {}

  public async init(): Promise<void> {
    try {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      this.context = canvas.getContext('webgpu')!;

      const devicePixelRatio = window.devicePixelRatio;
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      
      if (!this.context) {
        throw 'WebGPU unsupported';
      }

      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'low-power',
      });

      if (!adapter) {
        throw 'No adapter found';
      }

      this.device = await adapter?.requestDevice();

      this.context.configure({
        device: this.device as GPUDevice,
        format: 'bgra8unorm',
      });

      const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

      this.pipeline = this.device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: this.device.createShaderModule({
            code: triangleVertWGSL,
          }),
          entryPoint: 'main',
        },
        fragment: {
          module: this.device.createShaderModule({
            code: redFragWGSL,
          }),
          entryPoint: 'main',
          targets: [
            {
              format: presentationFormat,
            },
          ],
        },
        primitive: {
          topology: 'triangle-list',
        },
      });

    } catch (e: any) {
      console.error(e);
      alert(e);
      return;
    }
    console.log('successfully initialized');
  }

  public draw(): void {

    const commandEncoder = this.device?.createCommandEncoder() as GPUCommandEncoder;
    const textureView = this.context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };

    const passEncoder = commandEncoder?.beginRenderPass(renderPassDescriptor);

    // Draw stuff
    passEncoder.setPipeline(this.pipeline);
    passEncoder.draw(3);

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
    console.log('drawing');
  }
}

const renderer = new Renderer();
renderer.init().then(() => {
  renderer.draw();
});

export {};