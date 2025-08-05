exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('x_user_id', 255).unique().notNullable();
    table.string('x_username', 255).notNullable();
    table.text('x_access_token');
    table.text('x_refresh_token');
    table.string('email', 255);
    table.string('phone', 20);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('last_active');
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_banned').defaultTo(false);
    table.boolean('is_premium').defaultTo(false);
    table.timestamp('premium_expires_at');
    table.json('x_profile_data');
    table.json('settings').defaultTo('{}');
    
    // Indexes
    table.index('x_user_id');
    table.index('x_username');
    table.index('email');
    table.index('is_verified');
    table.index('is_banned');
    table.index('last_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};