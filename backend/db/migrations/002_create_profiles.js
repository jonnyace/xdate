exports.up = function(knex) {
  return knex.schema.createTable('profiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('display_name', 255);
    table.text('bio');
    table.integer('age').checkBetween([18, 100]);
    table.string('gender', 50);
    table.string('sexual_orientation', 50);
    table.decimal('location_lat', 10, 8);
    table.decimal('location_lng', 11, 8);
    table.string('location_name', 255);
    table.integer('location_radius').defaultTo(50); // km
    table.json('interests').defaultTo('[]');
    table.json('photos').defaultTo('[]');
    table.json('x_posts').defaultTo('[]');
    table.json('privacy_settings').defaultTo('{}');
    table.json('matching_preferences').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.boolean('show_me_on_x').defaultTo(true);
    table.integer('boost_count').defaultTo(0);
    table.timestamp('last_boost_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('user_id');
    table.index('age');
    table.index('gender');
    table.index('sexual_orientation');
    table.index(['location_lat', 'location_lng']);
    table.index('is_active');
    table.index('show_me_on_x');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('profiles');
};