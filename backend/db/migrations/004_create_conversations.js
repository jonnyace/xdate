exports.up = function(knex) {
  return knex.schema
    .createTable('conversations', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user1_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('user2_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('last_message_at');
      table.boolean('is_active').defaultTo(true);
      
      // Unique constraint for conversation pairs
      table.unique(['user1_id', 'user2_id']);
      
      // Indexes
      table.index('user1_id');
      table.index('user2_id');
      table.index('last_message_at');
      table.index('is_active');
    })
    .createTable('messages', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('conversation_id').references('id').inTable('conversations').onDelete('CASCADE');
      table.uuid('sender_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('content').notNullable();
      table.enum('message_type', ['text', 'image', 'x_post', 'emoji']).defaultTo('text');
      table.json('metadata');
      table.boolean('is_read').defaultTo(false);
      table.timestamp('read_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index('conversation_id');
      table.index('sender_id');
      table.index('message_type');
      table.index('is_read');
      table.index('created_at');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('messages')
    .dropTable('conversations');
};