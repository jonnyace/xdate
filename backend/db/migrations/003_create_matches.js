exports.up = function(knex) {
  return knex.schema.createTable('matches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('matched_user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('status', ['pending', 'liked', 'passed', 'mutual', 'blocked']).defaultTo('pending');
    table.boolean('is_super_like').defaultTo(false);
    table.boolean('is_boost').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('matched_at');
    table.json('match_score_data');
    
    // Unique constraint to prevent duplicate matches
    table.unique(['user_id', 'matched_user_id']);
    
    // Indexes
    table.index('user_id');
    table.index('matched_user_id');
    table.index('status');
    table.index('is_super_like');
    table.index('created_at');
    table.index('matched_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('matches');
};