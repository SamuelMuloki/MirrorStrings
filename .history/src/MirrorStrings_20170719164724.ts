import * as dojoDeclare from "dojo/_base/declare";
import * as domConstruct from "dojo/dom-construct";
import * as WidgetBase from "mxui/widget/_WidgetBase";
import * as dojoClass from "dojo/dom-class";

import "croppie/croppie.css";
import Croppie = require("croppie");
import { UrlHelper } from "./UrlHelper";

class MirrorStrings extends WidgetBase {

    // Parameters configured in modeler
    reverseEntity: string;
    mfToExecute: string;
    dataAttribute: string;

    // Internal variables
    private contextObj: mendix.lib.MxObject;
    private message: string;
    private textString: string;

    postCreate() {
        this.setupEvents();
    }

    update(object: mendix.lib.MxObject, callback?: () => void) {
        this.contextObj = object;
        //this.resetSubscriptions();
        this.updateRendering();

        if (callback) {
            callback();
        }
    }

    uninitialize(): boolean {
        return true;
    }

    private setupEvents() {
        if (this.mfToExecute !== "") {
            this.execMf(this.mfToExecute, this.contextObj.getGuid());
        }
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

    private saveTag(object) {
        mx.data.commit({
            mxobj: object,
            callback: function () {
                console.log("Object committed");
            },
            error: function (e) {
                console.error("Could not commit object:", e);
            }
        });
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

  private execMf(mf, guid, cb) {
        // logger.debug(this.id + "._execMf");
        if (mf && guid) {
            mx.ui.action(mf, {
                params: {
                    applyto: "selection",
                    guids: [guid]
                },
                callback: (function (objs) {
                    if (cb && typeof cb === "function") {
                        cb(objs);
                    }
                }.bind(this)),
                error: function (error) {
                    mx.ui.error("Error executing microflow " + mf + " : " + error.message);
                }
            }, this);
        }
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
dojoDeclare("MirrorStrings.widget.MirrorStrings", [WidgetBase], function (Source: any) {
    const result: any = {};
    for (const i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
}(MirrorStrings));
