import * as dojoDeclare from "dojo/_base/declare";
import * as domConstruct from "dojo/dom-construct";
import * as WidgetBase from "mxui/widget/_WidgetBase";
import * as dojoClass from "dojo/dom-class";

import "croppie/croppie.css";
import Croppie = require("croppie");
import { UrlHelper } from "./UrlHelper";

class MirrorStrings extends WidgetBase {

    // Parameters configured in modeler
    /*
    widthOfViewPort: number;
    heightOfViewPort: number;
    widthOfBoundary: number;
    heightOfBoundary: number;
    enableOrientation: boolean;
    enableZoom: boolean;
    enforceBoundary: boolean;
    mouseWheelZoom: boolean;
    showZoomer: boolean;
    typeOfViewPort: "square" | "circle";
    */

    // Internal variables
    /*
    private contextObject: mendix.lib.MxObject;
    private imageNode: HTMLElement;
    private croppie: Croppie;
    private configChecked: boolean;
    */
    
    postCreate() {
        this.croppie = new Croppie(this.domNode, {
            boundary: {
                height: this.heightOfViewPort * 1.2,
                width: this.widthOfViewPort * 1.2
            },
            enableOrientation: true,
            viewport: {
                height: this.heightOfViewPort,
                type: this.typeOfViewPort,
                width: this.widthOfViewPort
            }
        });
        this.setupEvents();
        this.cropImage();
        if (this.enableOrientation) {
            this.allowImageRotation();
        }
    }

    update(object: mendix.lib.MxObject, callback?: () => void) {
        this.contextObject = object;
        this.resetSubscriptions();
        this.updateRendering();

        if (callback) {
            callback();
        }
    }

    uninitialize(): boolean {
        if (this.croppie) {
            this.croppie.destroy();
        }

        return true;
    }

    private checkConfig() {
        if (this.contextObject.getSuperEntities().indexOf("System.Image") === -1) {
            window.mx.ui.error("Context object should be an image");
        }
        this.configChecked = true;
    }

    private setupEvents() {
        this.mxform.listen("commit", (callback, error) => {
            this.croppie.result({
                format: "jpeg",
                size: "original",
                type: "blob"
            }).then(croppedImage => this.saveImage(croppedImage, callback));
        });
    }

    private cropImage() {
        domConstruct.create("input", {
            class: "form-control btn-default",
            type: "button",
            value: "Crop Image"
        }, this.domNode).addEventListener("click", () => {
            this.croppie.result({
                circle: this.typeOfViewPort === "circle" ? true : false,
                format: "png",
                size: "viewport",
                type: "blob"
            }).then((croppedImage) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.croppie.bind({ url: reader.result });
                };
                reader.readAsDataURL(croppedImage);
            });
        }, false);
    }

    private allowImageRotation() {
        domConstruct.create("input", {
            class: "cr-rotate",
            type: "button",
            value: "Rotate"
        }, this.domNode).addEventListener("click", () => {
            this.croppie.rotate(90);
        }, false);
    }

    private updateRendering() {
        if (this.contextObject) {
            dojoClass.remove(this.domNode, "hidden");
            if (!this.configChecked) {
                this.checkConfig();
            }
            this.croppie.bind({
                url: UrlHelper.getDynamicResourceUrl(this.contextObject.getGuid(),
                    this.contextObject.get("changedDate") as number)
            });
        } else {
            dojoClass.add(this.domNode, "hidden");
        }
    }

    private saveImage(fileBlob: Blob, callback: () => void) {
        let fileName = this.contextObject.get("Name")as string;
        if (fileName && fileName.lastIndexOf(".") >= 0) {
            fileName = fileName.substring(0, fileName.lastIndexOf(".")) + ".jpeg";
        }
        window.mx.data.saveDocument(this.contextObject.getGuid(),
            fileName,
            {
                height: this.heightOfViewPort,
                width: this.widthOfViewPort
            },
            fileBlob,
            callback,
            error => console.error(error)
        );
    }

    private resetSubscriptions() {
        this.unsubscribeAll();
        if (this.contextObject) {
            this.subscribe({
                callback: () => this.updateRendering(),
                guid: this.contextObject.getGuid()
            });
        }
    }
}

// tslint:disable : only-arrow-functions
dojoDeclare("MirrorStrings.widget.MirrorStrings", [ WidgetBase ], function(Source: any) {
    const result: any = {};
    for (const i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
}(MirrorStrings));
