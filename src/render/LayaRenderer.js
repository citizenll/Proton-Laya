/**
MIT License
Copyright (c) 2025 citizenll
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import BaseRenderer from "./BaseRenderer";
import Types from "../utils/Types";
import ImgUtil from "../utils/ImgUtil";
import ColorUtil from "../utils/ColorUtil";
import MathUtil from "../math/MathUtil";

/**
 * Laya3 Renderer using graphics API
 * @extends BaseRenderer
 */
export default class LayaRenderer extends BaseRenderer {
    /**
     * Creates a new LayaRenderer instance
     * @param {Laya.Sprite} element - The Laya container to render to
     * @param {object} [stroke] - Stroke style {color, thickness}
     */
    constructor(element, stroke) {
        super(element);
        this.graphics = element.graphics;
        this.stroke = stroke;
        this.blendMode = null;
        this.name = "LayaRenderer";
    }

    /**
     * Resize the render area
     * @param {number} width 
     * @param {number} height 
     */
    resize(width, height) {
        this.element.width = width;
        this.element.height = height;
    }

    createBody(body, particle) {
        if (body.isCircle) return this.createCircle(particle);
        return this.createSprite(body, particle);
    }

    createSprite(body, particle) {
        this.getImgFromLaya(body, this.addImg2Body, particle);
    }

    createCircle(particle) {
        this.drawCircle(particle, this.graphics);
    }

    /**
     * Handle particle creation
     * @param {object} particle 
     */
    onParticleCreated(particle) {
        if (particle.body) {
            this.createSprite(particle.body, particle);
        } else {
            particle.color = particle.color || "#ff0000";
        }
    }

    getImgFromLaya(body, callback, param) {
        if (body.isInner) {
            let texture = Laya.loader.getRes(body.src);
            if (!texture) {
                Laya.loader.load(body.src, Laya.Loader.IMAGE).then(res => {
                    callback(res, param);
                })
                return;
            }
            return callback(texture, param)
        } else {
            return callback(body, param);
        }
    }

    /**
     * Handle particle updates
     * @param {object} particle 
     */
    onParticleUpdate(particle) {
        let graphics = this.graphics;
        if (particle.body) {
            if (this.isImage(particle.body)) {
                this.drawImage(particle, graphics);
            }
        } else {
            this.drawCircle(particle, graphics);
        }
    }

    onProtonUpdate() {
        this.graphics.clear();
    }

    isImage(target) {
        if (typeof target == "string") return false;
        if (target['uuid']) return true
    }

    /**
     * Handle particle destruction
     * @param {object} particle 
     */
    onParticleDead(particle) {
        particle.body = null;
    }

    /**
     * Add image to particle body
     * @param {HTMLImageElement} img 
     * @param {object} particle 
     */
    addImg2Body(img, particle) {
        particle.body = img;
    }

    /**
     * Draw image particle
     * @param {object} particle 
     * @param {Laya.Graphics} graphics
     */
    drawImage(particle, graphics) {
        const w = (particle.body.width * particle.scale) | 0;
        const h = (particle.body.height * particle.scale) | 0;
        const x = particle.p.x;
        const y = particle.p.y;

        graphics.save();
        if (this.blendMode) {
            graphics.blendMode = this.blendMode;
        }
        graphics.alpha = particle.alpha;
        graphics.drawImage(
            particle.body,
            x, y, w, h, this.rgbToHex(particle),
        );
        graphics.rotate(MathUtil.degreeTransform(particle.rotation));
        graphics.restore();
    }

    rgbToHex(particle) {
        const { r, g, b } = particle.rgb;
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    /**
     * Draw circle particle
     * @param {object} particle 
     * @param {Laya.Graphics} graphics
     */
    drawCircle(particle, graphics) {
        const color = particle.rgb
            ? `rgba(${particle.rgb.r},${particle.rgb.g},${particle.rgb.b},${particle.alpha})`
            : particle.color;

        graphics.save();
        if (this.blendMode) {
            graphics.blendMode = this.blendMode;
        }
        graphics.drawCircle(
            particle.p.x,
            particle.p.y,
            particle.radius,
            color,
            this.stroke ? this.stroke.color : null,
            this.stroke ? this.stroke.thickness : 0
        );
        graphics.restore();
    }

    /**
     * Clean up resources
     */
    destroy() {
        super.destroy();
        this.graphics.clear();
    }

    /**
     * @param particle
     */
    onParticleDead(particle) {
        particle.body = null;
    }
}
