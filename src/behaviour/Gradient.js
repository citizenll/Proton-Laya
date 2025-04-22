import ColorUtil from "../utils/ColorUtil";
import ArraySpan from "../math/ArraySpan";
import Behaviour from "./Behaviour";

export default class Gradient extends Behaviour {
  /**
   * 渐变颜色行为
   * @constructor
   * @param {Array} colors 颜色数组（支持十六进制或RGBA格式）
   * @param {Number} [life=Infinity] 生命周期 
   * @param {String} [easing=easeLinear] 缓动函数
   */
  constructor(colors, life, easing) {
    super(life, easing);
    this.colors = colors;
    this.name = "Gradient";
    this.reset(colors, life, easing);
  }

  reset(colors, life, easing) {
    this.colorSpan = ArraySpan.createArraySpan(colors);
    life && super.reset(life, easing);
  }

  initialize(particle) {
    const colors = this.colorSpan.getValue();
    particle.data.gradientColors = colors.map(color => {
      if (typeof color === 'string') {
        return ColorUtil.hexToRgba(color);
      } else if (Array.isArray(color) && color.length === 4) {
        if (color[0] <= 1) {
          color[0] = color[0] * 255;
          color[1] = color[1] * 255;
          color[2] = color[2] * 255;
        }
        return { r: color[0], g: color[1], b: color[2], a: color[3] };
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    });

    // 初始化起始颜色
    const firstColor = particle.data.gradientColors[0];
    particle.rgb = {
      r: firstColor.r,
      g: firstColor.g,
      b: firstColor.b,
      a: firstColor.a
    };
  }

  applyBehaviour(particle, time, index) {
    this.calculate(particle, time, index);

    const colors = particle.data.gradientColors;
    const total = colors.length - 1;
    const indexFloat = this.energy * total;
    const indexInt = Math.min(Math.floor(indexFloat), total - 1);
    const ratio = indexFloat - indexInt;

    const colorA = colors[indexInt];
    const colorB = colors[indexInt + 1];

    particle.rgb.r = colorA.r + (colorB.r - colorA.r) * ratio;
    particle.rgb.g = colorA.g + (colorB.g - colorA.g) * ratio;
    particle.rgb.b = colorA.b + (colorB.b - colorA.b) * ratio;
    // 保留原有透明度处理方式
    particle.rgb.a = colorA.a + (colorB.a - colorA.a) * ratio;

    // 转换为整型RGB值
    particle.rgb.r = particle.rgb.r << 0;
    particle.rgb.g = particle.rgb.g << 0;
    particle.rgb.b = particle.rgb.b << 0;
  }
}
