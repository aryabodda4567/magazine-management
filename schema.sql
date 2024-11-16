 -- Create Tables
CREATE TABLE magazines (
    magazine_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    publication_frequency VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE issues (
    issue_id SERIAL PRIMARY KEY,
    magazine_id INTEGER REFERENCES magazines(magazine_id) ON DELETE CASCADE,
    issue_number VARCHAR(20) NOT NULL,
    publication_date DATE NOT NULL,
    cover_image_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(issue_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(user_id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'writer' CHECK (role IN ('admin', 'editor', 'writer')),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    magazine_id INTEGER REFERENCES magazines(magazine_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(magazine_id, user_id)
);

-- Create Triggers with direct statements

-- 1. Update timestamp triggers
CREATE TRIGGER update_magazines_timestamp 
    BEFORE UPDATE ON magazines BEGIN
    UPDATE magazines SET updated_at = CURRENT_TIMESTAMP 
    WHERE magazine_id = NEW.magazine_id;
END;

CREATE TRIGGER update_articles_timestamp
    BEFORE UPDATE ON articles BEGIN
    UPDATE articles SET updated_at = CURRENT_TIMESTAMP 
    WHERE article_id = NEW.article_id;
END;

-- 2. Subscription validation trigger
CREATE TRIGGER check_subscription_dates
    BEFORE INSERT ON subscriptions
    WHEN NEW.end_date <= NEW.start_date BEGIN
    SELECT RAISE(ROLLBACK, 'End date must be after start date');
END;

-- 3. Auto-update issue status trigger
CREATE TRIGGER auto_publish_issue
    BEFORE INSERT ON issues
    WHEN NEW.publication_date <= CURRENT_DATE BEGIN
    UPDATE issues SET status = 'published' 
    WHERE issue_id = NEW.issue_id;
END;

-- 4. Prevent deletion of published articles trigger
CREATE TRIGGER no_delete_published_articles
    BEFORE DELETE ON articles
    WHEN OLD.status = 'published' BEGIN
    SELECT RAISE(ROLLBACK, 'Cannot delete published articles');
END;