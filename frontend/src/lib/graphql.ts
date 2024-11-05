const ALL_NODES_QUERY = `
  query AllNodes {
    allNodes {
      id
      filename
      title
      aliases
      tags
      links
      html
    }
  }
`;

export { ALL_NODES_QUERY };
