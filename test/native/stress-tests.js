var helper = require(__dirname + "/../test-helper");
var Client = require(__dirname + "/../../lib/native").Client;

test('many rows', function() {
  var client = new Client(helper.connectionString());
  client.connect();
  var q = client.query("SELECT * FROM person");
  var rows = [];
  q.on('row', function(row) {
    rows.push(row)
  });
  assert.emits(q, 'end', function() {
    client.end();
    assert.length(rows, 26);
  })
});

test('many queries', function() {
  var client = new Client(helper.connectionString());
  client.connect();
  var count = 0;
  var expected = 100;
  for(var i = 0; i < expected; i++) {
    var q = client.query("SELECT * FROM person");
    assert.emits(q, 'end', function() {
      count++;
    })
  }
  assert.emits(client, 'drain', function() {
    client.end();
    assert.equal(count, expected);
  })
})

test('many clients', function() {
  var clients = [];
  for(var i = 0; i < 20; i++) {
    clients.push(new Client(helper.connectionString()));
  }
  clients.forEach(function(client) {
    client.connect();
    for(var i = 0; i < 20; i++) {
      client.query('SELECT * FROM person');
    }
    assert.emits(client, 'drain', function() {
      client.end();
    })
  })
})