// lib/graphql/auth.queries.ts
import { gql } from "@apollo/client";

export const REGISTER_ORGANIZATION = gql`
  mutation RegisterOrganization(
    $orgInput: AddOrganizationInput!
    $adminInput: AddMemberInput!
  ) {
    addOrganization(input: [$orgInput]) {
      organization {
        id
        name
        slug
        members {
          id
          email
          name
          role {
            name
          }
        }
      }
    }
    addMember(input: [$adminInput]) {
      member {
        id
        email
        name
        password
        role {
          name
        }
        organization {
          id
          slug
        }
      }
    }
  }
`;

export const LOGIN_USER = gql`
  query LoginMember($email: String!) {
    queryMember(filter: { email: { eq: $email } }) {
      id
      email
      name
      password
      organization {
        id
        slug
      }
      role {
        name
      }
    }
  }
`;

export const VERIFY_ORGANIZATION = gql`
  query verifyOrganization($orgSlug: String) {
    queryOrganization(filter: { slug: { eq: $orgSlug } }) {
      id
      slug
      createdAt
      members {
        id
        name
        email
        role {
          name
        }
        createdAt
      }
    }
  }
`;

export const REVOKE_REFRESH_TOKEN = gql`
  mutation RevokeRefreshToken($userId: ID!) {
    updateMember(
      input: { filter: { id: { eq: $userId } }, remove: { refreshToken: null } }
    ) {
      member {
        id
      }
      numUids
    }
  }
`;

export const GET_REFRESH_TOKEN = gql`
  query GetRefreshToken($token: String!) {
    queryRefreshToken(filter: { hashedToken: { eq: $token } }) {
      id
      hashedToken
      expires
      revoked
      member {
        id
        email
        name
        role {
          name
        }
        organization {
          id
          slug
        }
      }
    }
  }
`;

export const GET_MEMBER_TOKENS = gql`
  query GetMemberTokens($memberId: ID!) {
    queryRefreshToken(filter: { revoked: false }) {
      id
      hashedToken
      expires
      revoked
      member(filter: { id: [$memberId] }) {
        id
        name
        email
        role {
          name
        }
        organization {
          id
          slug
        }
      }
    }
  }
`;

export const REVOKE_OLD_TOKENS = gql`
  mutation RevokeOldTokens($memberId: ID!) {
    deleteRefreshToken(filter: {}) {
      refreshToken {
        id
        member(filter: { id: [$memberId] }) {
          id
        }
      }
    }
  }
`;

export const CREATE_NEW_TOKEN = gql`
  mutation CreateNewToken($tokenInput: AddRefreshTokenInput!) {
    addRefreshToken(input: [$tokenInput]) {
      refreshToken {
        id
        hashedToken
        expires
        member {
          id
          email
        }
      }
    }
  }
`;

export const VALIDATE_REFRESH_TOKEN = gql`
  query ValidateRefreshToken($hashedToken: String!) {
    queryRefreshToken(filter: { hashedToken: { eq: $hashedToken } }) {
      id
      hashedToken
      expires
      revoked
      member {
        id
        email
        role {
          name
        }
        organization {
          id
          slug
        }
      }
    }
  }
`;

export const CHECK_TOKEN_STATUS = gql`
  query CheckTokenStatus($tokenId: ID!) {
    getRefreshToken(id: $tokenId) {
      id
      expires
      revoked
      member {
        id
        email
      }
    }
  }
`;
