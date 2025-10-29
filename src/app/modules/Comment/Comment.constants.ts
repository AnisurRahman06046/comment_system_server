/**
 * Reaction types for comments
 * Users can either LIKE or DISLIKE a comment
 */
export enum ReactionType {
  LIKE = "like",
  DISLIKE = "dislike",
}

/**
 * Sort types for fetching comments
 * MOST_LIKED: Sort by number of likes (descending)
 * MOST_DISLIKED: Sort by number of dislikes (descending)
 * NEWEST: Sort by creation date (descending) - default
 */
export enum SortType {
  MOST_LIKED = "mostLiked",
  MOST_DISLIKED = "mostDisliked",
  NEWEST = "newest",
}
