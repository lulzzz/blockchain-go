function Demo() {
    this.ui = new UI(this);
}
Demo.prototype.data = function () {
    return "working";
}