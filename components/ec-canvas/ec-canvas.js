Component({
  properties: {
    canvasId: { type: String, value: 'ec-canvas' },
    ec: { type: Object }
  },
  data: {},
  ready: function () {
    if (!this.data.ec) { console.warn('组件需绑定 ec 变量'); return; }
    if (this.data.ec.lazyLoad) return;
    this.init();
  },
  methods: {
    init: function () {
      console.log('ECharts 容器已就绪');
    }
  }
});
