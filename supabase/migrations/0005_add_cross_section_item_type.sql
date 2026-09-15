-- New item type: cross_section. Students enter (distance from bank, depth)
-- pairs and the app renders a generated stream-profile chart from them,
-- instead of (or alongside) a hand-drawn sketch photo.

alter type item_type add value 'cross_section';
