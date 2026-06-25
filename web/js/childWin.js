class childWin {
    constructor() {
        const childWin = window.open('video.html', 'child');
        // 等待子窗口加载完成后赋值
        childWin.onload = function () {
            debugger
            // 方法 A：直接修改子窗口全局变量
            childWin.myData = { name: "Alice", age: 25 };

            // 方法 B：调用子窗口定义的函数
            childWin.cilid({ name: "Alice" });
        };
    }
}