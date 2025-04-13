import { Component, useState, onMounted } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";

// Assuming generate_secret is globally available or imported from elsewhere
// If it's not global, you'll need to import it:
// import { generate_secret } from "/path/to/your/utils.js";
// If generate_secret isn't defined elsewhere, here's a basic placeholder:
if (typeof generate_secret === 'undefined') {
    window.generate_secret = function(length, characters) {
        let result = '';
        const charactersLength = characters.length;
        if (charactersLength === 0) return '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}


export class GeneratePassDialog extends Component {
    static template = "vault.GeneratePassDialog"; // We'll rename the QWeb template slightly
    static components = { Dialog };
    static props = {
        close: Function, // Provided by dialog service to close the dialog
        confirm: Function, // Callback to execute on confirmation
        cancel: Function, // Callback to execute on cancellation
        close: Function,
        options: { type: Object, optional: true }, // Pass original options if needed
    };

    setup() {
        this.notification = useService("notification");
        this.state = useState({
            length: this.props.options?.initialLength || 15, // Use passed option or default
            useBig: this.props.options?.useBig ?? true,
            useSmall: this.props.options?.useSmall ?? true,
            useDigits: this.props.options?.useDigits ?? true,
            useSpecial: this.props.options?.useSpecial ?? false,
            generatedPassword: "",
        });

        // Generate password initially when the component mounts
        onMounted(() => this.generatePassword());
    }

    /**
     * Generates a password based on the current state settings.
     */
    generatePassword() {
        let characters = "";
        if (this.state.useBig) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (this.state.useSmall) characters += "abcdefghijklmnopqrstuvwxyz";
        if (this.state.useDigits) characters += "0123456789";
        if (this.state.useSpecial) characters += "!?$%&/()[]{}|<>,;.:-_#+*\\";

        if (characters) {
            // Assuming generate_secret exists (either globally or imported)
            this.state.generatedPassword = generate_secret(this.state.length, characters);
        } else {
            this.state.generatedPassword = ""; // Clear if no character sets selected
        }
    }

    // --- Event Handlers ---

    onLengthChange(ev) {
        this.state.length = parseInt(ev.target.value, 10);
        this.generatePassword();
    }

    onCheckboxChange(ev) {
        const { name, checked } = ev.target;
        // Map checkbox name to state property
        const stateKey = {
            "big_letter": "useBig",
            "small_letter": "useSmall",
            "digits": "useDigits",
            "special": "useSpecial",
        }[name];

        if (stateKey) {
            this.state[stateKey] = checked;
            this.generatePassword();
        }
    }

    // --- Dialog Actions ---

    /**
     * Confirms the dialog, passing the generated password back.
     */
    _onConfirm() {
        if (!this.state.generatedPassword) {
            this.notification.add(_t("Please select at least one character type to generate a password."), {
                type: "warning",
            });
            return; // Don't close if password is empty
        }
        // Call the confirm callback passed in props, resolving the promise
        this.props.confirm(this.state.generatedPassword);
        this.props.close();
    }

    /**
     * Cancels the dialog.
     */
    _onCancel() {
        // Call the cancel callback passed in props, rejecting the promise
        this.props.cancel(_t("Cancelled"));
        this.props.close();
    }
}