CREATE TABLE users (
	user_id BIGSERIAL PRIMARY KEY,
	email TEXT NOT NULL,
	secret TEXT
);

CREATE TABLE tags ( 
	tag_id BIGSERIAL PRIMARY KEY,
	name TEXT NOT NULL
);

CREATE TABLE subscriptions (
	subscription_id BIGSERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	url TEXT NOT NULL,
	feed_path TEXT NOT NULL
);

CREATE TABLE items (
	item_id BIGSERIAL PRIMARY KEY,
	title TEXT,
	body TEXT,
	published DATE NOT NULL,
	url TEXT NOT NULL,
	hash TEXT,
	subscription_id BIGSERIAL REFERENCES subscriptions( subscription_id )
);

CREATE TABLE user_tags (
	ut_id BIGSERIAL PRIMARY KEY,
	user_id BIGSERIAL REFERENCES users( user_id ),
	tag_id BIGSERIAL REFERENCES tags( tag_id )
);

CREATE TABLE tagged_subscriptions (
	ut_id BIGSERIAL REFERENCES user_tags( ut_id ),
	subscription_id BIGSERIAL REFERENCES subscriptions( subscription_id ),
	PRIMARY KEY( ut_id, subscription_id )
);

CREATE TABLE user_items ( 
	user_id BIGSERIAL REFERENCES users( user_id ),
	subscription_id BIGSERIAL REFERENCES subscriptions( subscription_id ),
	item_id BIGSERIAL REFERENCES items( item_id ),
	read BOOLEAN NOT NULL DEFAULT false,
	mark_unread BOOLEAN NOT NULL DEFAULT false,
	starred BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY( user_id, item_id )
);