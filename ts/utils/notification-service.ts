/**
 * NotificationService for managing UI notifications.
 */
export class NotificationService {
  private readonly element: HTMLDivElement;
  private readonly stack: Array<string>;

  constructor(element: HTMLDivElement) {
    this.element = element;
    this.stack = [];
  }

  public show(message: string): void {
    this.stack.push(message);
    if (this.stack.length < 2) {
      this.push();
    }
  }

  private push(): void {
    if (this.stack.length === 0) return;

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
