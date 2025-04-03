import { Component, useState, useRef, onMounted } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { _t } from "@web/core/l10n/translation";
import utils from "vault.utils";

export class AskPassDialog extends Component {
    static template = "vault.AskPassDialog";
    static components = { Dialog };
    static props = {
        onDone: Function,
        close: Function,
        title: String,
        body: String,
        confirm: { type: Boolean, optional: true },
        password: { type: Boolean, optional: true, default: true },
        keyfile: { type: Boolean, optional: true, default: true },
    };

    setup() {
        this.state = useState({ password: "", confirm: "" });
        this.keyfileInput = useRef("keyfileInput");
        this.passwordInput = useRef("passwordInput");
        onMounted(() => {
            if (this.passwordInput.el) {
                this.passwordInput.el.focus();
            }
        });
    }

    async _confirm() {
        const password = this.state.password;
        const keyfileEl = this.keyfileInput.el;
        const keyfile = keyfileEl && keyfileEl.files.length > 0 ? keyfileEl.files[0] : null;

        if (!password && !keyfile) {
            // Maybe show a notification instead of alert?
            alert(_t("Password or keyfile is required."));
            return;
        }

        if (this.props.confirm && password !== this.state.confirm) {
            alert(_t("Passwords do not match."));
            return;
        }

        let keyfileContent = null;
        if (keyfile) {
            try {
                const textContent = await keyfile.text();
                keyfileContent = utils.fromBinary(textContent);
            } catch (e) {
                console.error("Error reading keyfile:", e);
                alert(_t("Could not read the selected keyfile."));
                return;
            }
        }

        this.props.onDone({ password: password, keyfile: keyfileContent });
        this.props.close();
    }

    _cancel() {
        this.props.onDone(false);
        this.props.close();
    }
}