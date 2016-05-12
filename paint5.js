function paint5(wrap, config) {

  this.tags = {
    wrap: wrap
  };
  this.config = {
    tools: {
      pen: {},
      brush: { width: 5 },
      eraser: { width: 15 },
    },
    width: 0,
    height: 0,
    touch: false,
  };
  this.tool = "brush";
  this.color = [0,100,255];
  this.pos = {
    x: 0, 
    y: 0
  };
  this.strokes = [];
  this.is_down = false;
  this.ctx = null;
  
  this.create = function() {
    this.tags.inner = document.createElement("div");
    this.tags.inner.className = "paint5";
    this.tags.canvas_wrap = document.createElement("div");
    this.tags.canvas_wrap.className = "canvas-wrap";
    this.tags.canvas = document.createElement("canvas");
    this.tags.toolbelt = document.createElement("div");
    this.tags.toolbelt.className = "toolbelt";
    this.tags.tools = {};
    for (var key in this.config.tools) {
      this.tags.tools[key] = document.createElement("div");
      this.tags.tools[key].className = "tool tool-"+key;
      if (this.tool == key)
        this.tags.tools[key].classList.add("active");
      this.tags.toolbelt.appendChild(this.tags.tools[key]);
    }
    this.tags.canvas_wrap.appendChild(this.tags.canvas);
    this.tags.inner.appendChild(this.tags.canvas_wrap);
    this.tags.inner.appendChild(this.tags.toolbelt);
    this.tags.wrap.appendChild(this.tags.inner);
    if (this.config.width == 0)
      this.tags.canvas.width = this.tags.canvas_wrap.offsetWidth;
    else
      this.tags.canvas.width = this.config.width;
    if (this.config.height == 0)
      this.tags.canvas.height = this.tags.canvas_wrap.offsetHeight;
    else
      this.tags.canvas.height = this.config.height;
    this.ctx = this.tags.canvas.getContext("2d");
    this.bind();
    this.onResize();
  }

  this.bind = function() {
    var self = this;
    window.addEventListener("resize", function(e) { self.onResize(e); }, false);
    this.tags.canvas.addEventListener(this.evt("down"), function(e) { self.onDown(e); }, false);
    window.addEventListener(this.evt("up"), function(e) { self.onUp(e); }, false);
    window.addEventListener(this.evt("move"), function(e) { self.onMove(e); }, false);
    for (var key in this.config.tools) {
      (function(k) {
        self.tags.tools[k].addEventListener("click", function(){ self.toolOnClick(k); }, false);
      }(key));
    }
  }

  this.onResize = function(e) {
    this.pos = this.getPos(this.tags.canvas);
  }
  this.onDown = function(e) {
    this.is_down = true;
    this.strokeStart(this.getPoint(e));
  }
  this.onUp = function(e) {
    this.is_down = false;
    this.strokeEnd();
  }
  this.onMove = function(e) {
    if (this.is_down)
      this.pointAdd(this.getPoint(e));
  }

  this.strokeStart = function(p) {
    this.strokes.unshift([p]);
    this.drawStart(p);
  }
  this.strokeEnd = function() {
    this.drawStop();
  }
  this.pointAdd = function(p) {
    p.created = Date.now();
    this.strokes[0].unshift(p);
    this.drawPoint(p, this.strokes[0][1]);
  }

  this.toolOnClick = function(key) {
    if (this.tool == key)
      return;
    this.toolSet(key);
  }
  this.toolSet = function(key) {
    if (this.tool)
      this.tags.tools[this.tool].classList.remove("active");
    this.tags.tools[key].classList.add("active");
    this.tool = key;
  }

  this.drawStart = function(p) {
    if (this.tool == "pen") {
      this.ctx.strokeStyle = "rgb("+this.color[0]+","+this.color[1]+","+this.color[2]+")";
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
    }
    if (this.tool == "brush") {
      this.drawBrush(p.x, p.y, this.config.tools[this.tool].width, this.color, 1);
    }
    if (this.tool == "eraser") {
      this.drawBrush(p.x, p.y, this.config.tools[this.tool].width, [255,255,255], 1);
    }
  }
  this.drawStop = function() {
    if (this.tool == "pen") {
      this.ctx.closePath();
    }
  }
  this.drawPoint = function(p, p2) {
    if (this.tool == "pen") {
      this.ctx.lineTo(p.x, p.y);
      this.ctx.stroke();
    }
    if (this.tool == "brush") {
      var d = Math.sqrt(Math.pow(p2.x-p.x,2) + Math.pow(p2.y-p.y, 2));
      for (var i=0; i<d; i++) {
        var s = i/d;
        this.drawBrush(p2.x*s + p.x*(1-s), p2.y*s + p.y*(1-s), this.config.tools[this.tool].width, this.color, 0.5);
      }
    }
    if (this.tool == "eraser") {
      var d = Math.sqrt(Math.pow(p2.x-p.x,2) + Math.pow(p2.y-p.y, 2));
      for (var i=0; i<d; i++) {
        var s = i/d;
        this.drawBrush(p2.x*s + p.x*(1-s), p2.y*s + p.y*(1-s), this.config.tools[this.tool].width, [255,255,255], 0.8);
      }
    }
  }
  this.drawBrush = function(x,y,w,c,a) {
    var gradient = this.ctx.createRadialGradient(x, y, 0, x, y, w);
    gradient.addColorStop(0, "rgba("+c[0]+","+c[1]+","+c[2]+","+a+")");
    gradient.addColorStop(1, "rgba("+c[0]+","+c[1]+","+c[2]+",0)");
    this.ctx.beginPath();
    this.ctx.arc(x, y, w, 0, 2*Math.PI);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.closePath();
  }

  this.clear = function() {
    this.tags.canvas.height = this.tags.canvas.height;
  }

  this.evt = function(on) {
    if (on == "down")
      return (this.touch ? "touchstart" : "mousedown");
    if (on == "up")
      return (this.touch ? "touchend" : "mouseup");
    if (on == "move")
      return (this.touch ? "touchmove" : "mousemove");
  }

  this.setConfig = function(config) {
    for (var key in config)
      this.config[key] = config[key];
    if (typeof(this.config.tools[this.tool]) == "undefined") {
      for (var key in this.config.tools) {
        this.tool = key;
        break;
      }
    }
  }

  this.getPos = function(el) {
    for (var pos={x: 0, y:0}; el != null; pos.x+= el.offsetLeft, pos.y+= el.offsetTop, el = el.offsetParent);
    return pos;
  }
  this.getPoint = function(e) {
    evt = (e.type == "touchmove" || e.type == "touchstart" ? e.touches[0] : (e.type == "touchend" ? e.changedTouches[0] : e));
    return {x: evt.clientX - this.pos.x + document.documentElement.scrollLeft, y: evt.clientY - this.pos.y + document.documentElement.scrollTop};
  }

  if (config)
    this.setConfig(config);

}