var rectangle = document.getElementsByClassName("button-rectangle")[0];
var canvasContent = document.getElementsByClassName("canvas-content")[0];
var shapesInfo = []; //存储canvas中的所有图形信息
var ctx = getCanvas();
var shapeStore = [];
var startCoordinate = {};
//鼠标行为属性
var mouseAction = {
    canStart: false,
    canDraw: false,
    canChangeMouseType: false,
    canResize: false,
    canAdjust: false
};

function getCanvas() {
    var c = canvasContent.getContext("2d");
    c.lineWidth = 2;
    c.strokeStyle = "red";
    c.save();
    return c;
}

rectangle.onclick = function() {
    mouseAction.canStart = true;
};

canvasContent.onmousedown = function(event) {
    //鼠标按下时的坐标
    setStartCoordinate(event.offsetX, event.offsetY);
    if (mouseAction.canStart) {
        mouseAction.canDraw = true;
    }
    if (mouseAction.canResize && (getMouseType() != "default")) {
        mouseAction.canAdjust = true;
    }
};

function setStartCoordinate(xCoordinate, yCoordinate) {
    startCoordinate.x = xCoordinate;
    startCoordinate.y = yCoordinate;
}

canvasContent.onmousemove = function(event) {
    mouseMoveAction(event);
};

//鼠标move时的行为
function mouseMoveAction(event) {
    var currentCoordinate = {
        x: event.offsetX,
        y: event.offsetY
    };
    if (mouseAction.canStart && mouseAction.canDraw) {
        var rect = calculateShapeInfo(startCoordinate, currentCoordinate);
        shapeStore.push(rect);
        redraw(shapeStore);
    };
    if (mouseAction.canAdjust) {
        var currentShape = getActiveShape();
        if (shapeStore.length == 0) {
            ctx.clearRect(currentShape.left - 7, currentShape.top - 7, currentShape.width + 14, currentShape.height + 14);
        }
        var moveDistance = {};
        moveDistance.x = currentCoordinate.x - startCoordinate.x;
        moveDistance.y = currentCoordinate.y - startCoordinate.y;
        var nextShape = {};
        nextShape.left = currentShape.left + moveDistance.x;
        nextShape.top = currentShape.top + moveDistance.y;
        nextShape.width = currentShape.width;
        nextShape.height = currentShape.height;
        shapeStore.push(nextShape);
        redraw(shapeStore);

        //TODO: 解决移动图形时产生的问题
        // shapesInfo[shapesInfo.length - 1].left = shapeStore[0].left;
        // shapesInfo[shapesInfo.length - 1].top = shapeStore[0].top;
        // shapesInfo[shapesInfo.length - 1].width = shapeStore[0].width;
        // shapesInfo[shapesInfo.length - 1].height = shapeStore[0].height;
        console.log(shapeStore[0]);
    }
    if (mouseAction.canChangeMouseType) {
        locateMouse(shapesInfo[shapesInfo.length - 1], event);
    }
};

//获取当前活动的图形
function getActiveShape() {
    if (shapesInfo[shapesInfo.length - 1].scalable == true) {
        return shapesInfo[shapesInfo.length - 1];
    } else {
        return undefined;
    }
}

//鼠标松开时触发
canvasContent.onmouseup = function(event) {
    if ((mouseAction.canStart && mouseAction.canDraw) || (mouseAction.canResize && mouseAction.canAdjust)) {
        finishDrawing(shapeStore);
        mouseAction.canChangeMouseType = true;
        mouseAction.canResize = true;
    };
}

//绘制图形
function redraw(shapeStore) {
    //当鼠标移动时，移除上一帧图形
    if (shapeStore[1]) {
        ctx.clearRect(shapeStore[0].left - 1, shapeStore[0].top - 1, shapeStore[0].width + 2, shapeStore[0].height + 2);
        shapeStore.reverse().pop();
    }
    ctx.strokeRect(shapeStore[0].left, shapeStore[0].top, shapeStore[0].width, shapeStore[0].height);
}

function calculateShapeInfo(start, end) {
    var info = {};
    info.width = Math.abs(end.x - start.x);
    info.height = Math.abs(end.y - start.y);
    info.top = start.y < end.y ? start.y : end.y;
    info.left = start.x < end.x ? start.x : end.x;
    return info;
}

//鼠标松开结束画图
function finishDrawing(shapeStore) {
    var data = shapeStore[0];
    if (mouseAction.canStart && mouseAction.canDraw) {
        mouseAction.canStart = false;
        mouseAction.canDraw = false;
        data.shape = "rectangle";
        data.scalable = true;
        shapesInfo.push(data);
    }
    if (mouseAction.canResize && mouseAction.canAdjust) {
        mouseAction.canResize = false;
        mouseAction.canAdjust = false;
    }
    drawBorder(data);
    shapeStore.length = 0;
}

//定位当前鼠标的位置，用于改变鼠标类型
function locateMouse(shapeInfo, mouse) {
    var dashOffset = 3;
    if ((mouse.offsetX >= shapeInfo.left - dashOffset - 3) && (mouse.offsetX <= shapeInfo.left - dashOffset + 3) && (mouse.offsetY >= shapeInfo.top - dashOffset - 3) && (mouse.offsetY <= shapeInfo.top - dashOffset + 3)) {
        changeMouseType("nw-resize");
    } else if ((mouse.offsetX >= shapeInfo.left + shapeInfo.width + dashOffset - 3) && (mouse.offsetX <= shapeInfo.left + shapeInfo.width + dashOffset + 3) && (mouse.offsetY >= shapeInfo.top - dashOffset - 3) && (mouse.offsetY <= shapeInfo.top - dashOffset + 3)) {
        changeMouseType("ne-resize");
    } else if ((mouse.offsetX >= shapeInfo.left + shapeInfo.width + dashOffset - 3) && (mouse.offsetX <= shapeInfo.left + shapeInfo.width + dashOffset + 3) && (mouse.offsetY >= shapeInfo.top + shapeInfo.height + dashOffset - 3) && (mouse.offsetY <= shapeInfo.top + shapeInfo.height + dashOffset + 3)) {
        changeMouseType("se-resize");
    } else if ((mouse.offsetX >= shapeInfo.left - dashOffset - 3) && (mouse.offsetX <= shapeInfo.left - dashOffset + 3) && (mouse.offsetY >= shapeInfo.top + shapeInfo.height + dashOffset - 3) && (mouse.offsetY <= shapeInfo.top + shapeInfo.height + dashOffset)) {
        changeMouseType("sw-resize");
    } else if ((mouse.offsetX > shapeInfo.left) && (mouse.offsetX < shapeInfo.left + shapeInfo.width) && (mouse.offsetY >= shapeInfo.top - dashOffset) && (mouse.offsetY < shapeInfo.top)) {
        changeMouseType("n-resize");
    } else if ((mouse.offsetX > shapeInfo.left + shapeInfo.width) && (mouse.offsetX <= shapeInfo.left + shapeInfo.width + dashOffset) && (mouse.offsetY > shapeInfo.top) && (mouse.offsetY < shapeInfo.top + shapeInfo.height)) {
        changeMouseType("e-resize");
    } else if ((mouse.offsetX > shapeInfo.left) && (mouse.offsetX < shapeInfo.left + shapeInfo.width) && (mouse.offsetY > shapeInfo.top + shapeInfo.height) && (mouse.offsetY <= shapeInfo.top + shapeInfo.height + dashOffset)) {
        changeMouseType("s-resize");
    } else if ((mouse.offsetX >= shapeInfo.left - dashOffset) && (mouse.offsetX < shapeInfo.left) && (mouse.offsetY > shapeInfo.top) && (mouse.offsetY < shapeInfo.top + shapeInfo.height)) {
        changeMouseType("w-resize");
    } else if ((mouse.offsetX >= shapeInfo.left) && (mouse.offsetX <= shapeInfo.left + shapeInfo.width) && (mouse.offsetY >= shapeInfo.top) && (mouse.offsetY <= shapeInfo.top + shapeInfo.height)) {
        changeMouseType("move");
    } else {
        changeMouseType("default");
    }
}

//改变鼠标指针的类型
function changeMouseType(type) {
    canvasContent.style.cursor = type;
}

//获取当前鼠标的类型
function getMouseType() {
    return canvasContent.style.cursor;
}

//获取当前鼠标的操作行为
function getMouseAction() {
    return getMouseType();
}

//当图形刚绘制完成时描出其边框
function drawBorder(data) {
    //虚线框与图形间的间隔
    var dashOffset = 3;
    ctx.setDashStyle("black", 1, [5]);
    //上虚线框
    ctx.drawDash(data.left, data.top - dashOffset, data.left + data.width, data.top - dashOffset);
    //右虚线框
    ctx.drawDash(data.left + data.width + dashOffset, data.top, data.left + data.width + dashOffset, data.top + data.height);
    //下虚线框
    ctx.drawDash(data.left + data.width, data.top + data.height + dashOffset, data.left, data.top + data.height + dashOffset);
    //左虚线框
    ctx.drawDash(data.left - dashOffset, data.top + data.height, data.left - dashOffset, data.top);
    //绘制边框圆角
    ctx.setLineDash([]);
    //左上角
    ctx.drawArc(data.left - dashOffset, data.top - dashOffset, 3, 0, 2 * Math.PI);
    //右上角
    ctx.drawArc(data.left + data.width + dashOffset, data.top - dashOffset, 3, 0, 2 * Math.PI);
    //右下角
    ctx.drawArc(data.left + data.width + dashOffset, data.top + data.height + dashOffset, 3, 0, 2 * Math.PI);
    //左下角
    ctx.drawArc(data.left - dashOffset, data.top + data.height + dashOffset, 3, 0, 2 * Math.PI);
    ctx.restore();
}

//绘制圆形
CanvasRenderingContext2D.prototype.drawArc = function(x1, y1, radius, startAngle, endAngle) {
    this.beginPath();
    this.arc(x1, y1, radius, startAngle, endAngle);
    this.stroke();
}

//设置虚线的样式
CanvasRenderingContext2D.prototype.setDashStyle = function(color, width, interval) {
    this.strokeStyle = color;
    this.lineWidth = width;
    this.setLineDash(interval);
}

//绘制虚线
CanvasRenderingContext2D.prototype.drawDash = function(x1, y1, x2, y2) {
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
}

//当图形绘画完毕时弹出消息框
function popupMessage(shapeCoordinate) {
    //弹出消息框与图形的垂直方向上的间隔
    var POPUP_TOP = 20;
    var popup = document.getElementsByClassName("popup")[0];
    var confirm = document.getElementById("confirm");
    var cancel = document.getElementById("cancel");
    var input = document.getElementById("info-input");
    var output = document.getElementById("info-output");
    popup.style.display = "block";
    var leftDistance = canvasContent.offsetLeft + shapeCoordinate.left + shapeCoordinate.width / 2 - popup.clientWidth / 2;
    var topDistance = canvasContent.offsetTop + shapeCoordinate.top + shapeCoordinate.height + POPUP_TOP;
    popup.style.left = leftDistance;
    popup.style.top = topDistance;

    //点击确定按钮后，打印信息
    confirm.onclick = function() {
        var outputInfo = JSON.stringify(shapeCoordinate) + "\n" + input.value + "\n";
        output.value += outputInfo;
        popup.style.display = "none";
        input.value = "";
    };

    //点击取消时，关闭弹出框并清除已画的图形。
    cancel.onclick = function() {
        popup.style.display = "none";
        ctx.clearRect(shapeCoordinate.left - 1, shapeCoordinate.top - 1, shapeCoordinate.width + 2, shapeCoordinate.height + 2);
    };
}
