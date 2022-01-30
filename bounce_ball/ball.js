'use strict';

function Unit(canvas) {
  this.units = [];
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.lastTime = new Date().getTime();
  this.settings = {
    unitMaximum: 5, // 한 번에 떨어지는 요소 개수
    radius: 15, // 원 반지름
    gravity: 0.6, // 떨어지는 속도
    corFactor: 0.4,// 튕김
    mass: 1, // 원 면적
    creationFactor: 0.4 // 생성 주기?
  };

  this.init();
};

Unit.prototype.init = function() { // 스크린 사이즈 변화에 따라 캔버스 사이즈 재설정
  window.onresize = function() {
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    this.canvas.width = width;
    this.canvas.height = height;
  };
  window.onresize();
};

Unit.prototype.addUnit = function(settings) {
  var self = this;

  if(self.units.length >= self.settings.unitMaximum) { // 설정한 unitMaximum의 값보다 작을때까지 요소 추가 생성
    return false;
  }

  settings.radius = self.settings.radius;
  settings.mass = Math.random() * self.settings.mass / 2 + self.settings.mass / 4 * 3;
  settings.bounceCount = 0;

  settings.velocity = {
    x: Math.random() * 4 - 2,
    y: 0
  };

  this.units.push(settings);
};

Unit.prototype.getVelocity = function(unit1, unit2) {
  var self = this;
  return {
    x: ((unit1.mass - unit2.mass * self.settings.corFactor) / (unit1.mass + unit2.mass) * unit1.velocity.x) + ((unit2.mass + unit2.mass * self.settings.corFactor) / (unit1.mass + unit2.mass) * unit2.velocity.x),
    y: ((unit1.mass - unit2.mass * self.settings.corFactor) / (unit1.mass + unit2.mass) * unit1.velocity.y) + ((unit2.mass + unit2.mass * self.settings.corFactor) / (unit1.mass + unit2.mass) * unit2.velocity.y)
  };
};

Unit.prototype.update = function() {
  var self = this;

  self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

  if(self.units.length < self.settings.unitMaximum) {
    if(Math.random() <= self.settings.creationFactor) { // 요소 추가
      self.addUnit({
        x: self.canvas.width * Math.random(),
        y: self.canvas.height
      });
    }
  }

  for(var idx in self.units) {
    self.units[idx].cals = false;
  }

  for(var idx in self.units) {
    var collapsed = false;

    var unit = self.units[idx];
    var afterUnitPosition = {
      x: unit.x + unit.velocity.x,
      y: unit.y - unit.velocity.y,
    };

    if(unit.cals === false) {
      // Skip of pre-calculated units.

      for(var key in self.units) {
        if(key === idx) {
          continue;
        }

        var item = self.units[key];
        var afterItemPosition = {
          x: item.x + item.velocity.x,
          y: item.y - item.velocity.y,
        };

        var distanceUnits = Math.sqrt(Math.pow(afterItemPosition.x - afterUnitPosition.x, 2) + Math.pow(afterItemPosition.y - afterUnitPosition.y, 2), 2);
        var sumRadius = item.radius + unit.radius;

        if(distanceUnits < sumRadius) {
          collapsed = true;

          var afterVelocity1 = self.getVelocity(unit, item);
          var afterVelocity2 = self.getVelocity(item, unit);

          unit.velocity.x = afterVelocity1.x;
          unit.velocity.y = afterVelocity1.y;
          item.velocity.x = afterVelocity2.x;
          item.velocity.y = afterVelocity2.y;

          unit.cals = true;
          item.cals = true;

          break;
        }
      }
    }

    if(
      unit.x + unit.velocity.x <= 0 ||
      unit.x + unit.velocity.x + unit.radius >= self.canvas.width
    ) {
      collapsed = true;
      unit.velocity.x *= -1;
    }
    
    if(unit.y - unit.velocity.y < 0) {
      if(unit.bounceCount > 5) { // 튕김 횟수
        self.units.splice(idx, 1);
        continue;
      } else {
        collapsed = true;
        unit.velocity.y *= -self.settings.corFactor; // 해당 코드 지우면 바닥과 충돌하지 않고 쭉 떨어짐
        unit.bounceCount += 1;
      }
    } else {
      unit.velocity.y += self.settings.gravity;
    }
    
    unit.x += unit.velocity.x;
    unit.y -= unit.velocity.y;

    self.context.beginPath();
    self.context.arc(unit.x, self.canvas.height - unit.y, unit.radius * unit.mass, 0, 2 * Math.PI, false);

    if(collapsed === true) {
      self.context.fillStyle = 'red'; // 겹친 요소 색상 표시
    } else {
      self.context.fillStyle = 'black';
    }

    self.context.fill();
    self.context.closePath();
  }

  self.context.font = '14px nanum gothic';
  self.context.fillStyle = '#000000';
  self.context.fillText((parseInt(1000 / (new Date().getTime() - this.l)) + ' fps'), this.w - 50, 20);
  self.lastTime = new Date().getTime();

  window.requestAnimationFrame(function() {
    self.update.call(self);
  });
}

window.onload = function() {
  var canvas = document.getElementById('canvas');
  var unit = new Unit(canvas);

  unit.update();
};