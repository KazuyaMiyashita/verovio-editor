/**
 * NotificationService for managing UI notifications.
 */
export class NotificationService {
    element;
    stack;
    constructor(element) {
        this.element = element;
        this.stack = [];
    }
    show(message) {
        this.stack.push(message);
        if (this.stack.length < 2) {
            this.push();
        }
    }
    push() {
        if (this.stack.length === 0)
            return;
        this.element.textContent = this.stack[0];
        this.element.classList.remove("disabled");
        setTimeout(() => {
            this.element.classList.add("disabled");
            this.stack.shift();
            if (this.stack.length > 0) {
                this.push();
            }
        }, 3500);
    }
}
//# sourceMappingURL=notification-service.js.map