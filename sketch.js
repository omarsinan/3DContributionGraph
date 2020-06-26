let contrib;
let number_of_days;
let size;
let text;
let from_date;
let username = '';
let max_contrib = 0;
let boxes = [];
let inp;

function create_text(s, x, y) {
  let text = createGraphics(width, 60);
  text.textFont('Source Code Pro');
  text.textAlign(CENTER, CENTER);
  text.textSize(16);
  text.fill(0);
  text.noStroke();
  text.text(s, x, y);
  return text;
}

function get_beginning_of_week(d) {
  d = new Date(d);
  var day = d.getDay(), diff = d.getDate() - day
  return new Date(d.setDate(diff));
}

function show_graph() {
  boxes = [];
  username = inp.value();
  const url = `https://github-contributions-api.now.sh/v1/${username}?format=nested`;
  httpGet(url, 'json', false, function(response) {
    from_date = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    from_date = get_beginning_of_week(from_date);
    const to_date = new Date();
    const diffTime = Math.abs(from_date - to_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    number_of_days = diffDays + 1;
    size = 400 / (number_of_days / 7);
    let year = from_date.getFullYear();
    let month = from_date.getMonth() + 1;
    let day = from_date.getDate();
    let current_year;
    let x = 0;
    let y = 0;
    let local_contrib = response.contributions;
    for (let i = 1; i <= number_of_days; i++) {
      if (local_contrib.year == year) {
        current_year = local_contrib.contributions[year];
      } else {
        current_year = local_contrib[year];
      }
      max_contrib = max(current_year[month][day].count, max_contrib);
      if (i % 7 == 0) {
        x = size;
        y = -(size * 6);
      } else {
        x = 0;
        y = size;
      }
      boxes.push([current_year[month][day], x, y]);
      if (current_year[month][day + 1] === undefined) {
        if (current_year[month + 1] === undefined) {
          year += 1;
          month = 1;
          day = 1;
        } else {
          month += 1;
          day = 1;
        }
      } else {
        day += 1;
      }
    }
    contrib = response.contributions;
    loop();
  });
}

function setup() {
  createCanvas(400, 400, WEBGL);
  let label = createP('GitHub username:');
  inp = createInput('');
  let button = createButton('Submit');
  button.mousePressed(show_graph);
}

function draw() {
  background(255);
  push();
  fill(0);
  if (username != '') {
    texture(create_text(`3D GitHub Contributions Graph\nusername: ${username}`, width/2, 30));
  } else {
    texture(create_text(`3D GitHub Contributions Graph\nPlease enter your GitHub username`, width/2, 30));
  }
  noStroke();
  translate(0, -height/2 + 30);
  plane(width, 60);
  pop();
  push();
  translate(-180, -80, -80);
  rotateX(1);
  rotateZ(0.8);
  if (contrib != undefined) {
    stroke('#666');
    for (let i = 0; i < boxes.length; i++) {
      push();
      fill(boxes[i][0].color);
      intensity = boxes[i][0].count;
      const depth = map(intensity, 0, max_contrib, 10, 60);
      translate(0, 0, depth/2);
      box(size, size, depth);
      pop();
      translate(boxes[i][1], boxes[i][2]);
    }
    noLoop();
  }
  pop();
}