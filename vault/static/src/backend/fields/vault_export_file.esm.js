/** @odoo-module alias=vault.export.file **/
// © 2021-2024 Florian Kantelberg - initOS GmbH
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import {BinaryField, binaryField} from "@web/views/fields/binary/binary_field";
import Exporter from "vault.export";
import VaultMixin from "vault.mixin";
import {_t} from "@web/core/l10n/translation";
import {downloadFile} from "@web/core/network/download";
import {registry} from "@web/core/registry";
import utils from "vault.utils";
import {useService} from "@web/core/utils/hooks";

export default class VaultExportFile extends VaultMixin(BinaryField) {
    setup() {
        super.setup(...arguments);
        this.exporter = useService("vault.exporter");
    }
    /**
     * Call the exporter and download the finalized file
     */
    async onFileDownload() {
        if (!this.props.record.data.content) {
            this.do_warn(
                _t("Save As..."),
                _t("The field is empty, there's nothing to save!")
            );
        } else if (utils.supported()) {
            const content = JSON.stringify(
                await this.exporter.export(
                    await this._getMasterKey(),
                    this.fileName,
                    this.props.record.data.content
                )
            );

            const buffer = new ArrayBuffer(content.length);
            const arr = new Uint8Array(buffer);
            for (let i = 0; i < content.length; i++) arr[i] = content.charCodeAt(i);

            const blob = new Blob([arr]);
            await downloadFile(blob, this.fileName || "");
        }
    }
}

VaultExportFile.template = "vault.FileVaultExport";

function extractProps(attrs, field) {
    return {
        ...binaryField.extractProps(attrs, field),
        fieldKey: attrs.key,
        fieldIV: attrs.iv,
    }
}

export const vaultExportFile = {
    component: VaultExportFile,
    extractProps,
};

registry.category("fields").add("vault_export_file", vaultExportFile);
