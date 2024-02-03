class Renderer{

  private context!: GPUCanvasContext;
  private device!: GPUDevice;

  public async initialize(){
    try{
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      this.context = canvas.getContext('webgpu')!;

      if(!this.context){
        throw 'WebGPU unsupported';
      }

      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: "low-power"
      });

      if(!adapter){
        throw 'No adapter found';
      }

      this.device = await adapter?.requestDevice();

      this.context.configure({
        device: this.device as GPUDevice,
        format: navigator.gpu.getPreferredCanvasFormat()
      });

    }catch(e: any){
      console.error(e);
      alert(e);
      return;
    }
    console.log('succesfully initialized');
  }
  
  public draw(): void {

    const commandEncoder = this.device?.createCommandEncoder() as GPUCommandEncoder;
    const textureView = this.context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store'
      }]
    }

    const passEncoder = commandEncoder?.beginRenderPass(renderPassDescriptor);

    // Draw stuff..

    passEncoder.end();
    this.device?.queue.submit([commandEncoder.finish()]);

    console.log('drawing');
  }
}

const renderer = new Renderer();
renderer.initialize().then(()=>{
  renderer.draw();
})

export {}