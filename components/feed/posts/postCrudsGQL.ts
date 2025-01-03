"use client";
import { gql } from "@apollo/client";

export const GET_POSTS_FROM_AUTHOR = gql`
  query GetAuthor($id: ID!, $orgSlug: String) {
    queryOrganization(filter: { slug: { eq: $orgSlug } }) {
      id
      slug
      authors(filter: { id: [$id] }) {
        id
        name
        email
        posts {
          id
          title
          content
          tags
        }
      }
      createdAt
    }
  }
`;

export const ADD_POST = gql`
  mutation addPost($post: AddPostInput!) {
    addPost(input: [$post]) {
      post {
        organization {
          id
          slug
        }
        id
        title
        content
        author {
          id
          name
          email
        }
      }
    }
  }
`;

export const UPDATE_POST = gql`
  mutation updatePost($patch: UpdatePostInput!) {
    updatePost(input: $patch) {
      post {
        id
        title
        content
        tags
      }
    }
  }
`;

export const DELETE_POST = gql`
  mutation deletePost($filter: PostFilter!) {
    deletePost(filter: $filter) {
      msg
      post {
        id
        title
        content
        tags
      }
    }
  }
`;
