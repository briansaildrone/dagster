import {gql, useLazyQuery} from '@apollo/client';
import {Box, Caption, Colors} from '@dagster-io/ui-components';
import {useVirtualizer} from '@tanstack/react-virtual';
import * as React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import {Container, HeaderCell, Inner, Row, RowCell} from '../ui/VirtualizedTable';

import {useDelayedRowQuery} from './VirtualizedWorkspaceTable';
import {RepoAddress} from './types';
import {SingleGraphQuery, SingleGraphQueryVariables} from './types/VirtualizedGraphTable.types';
import {workspacePathFromAddress} from './workspacePath';

export type Graph = {name: string; path: string; description: string | null};

interface Props {
  graphs: Graph[];
  repoAddress: RepoAddress;
}

export const VirtualizedGraphTable: React.FC<Props> = ({repoAddress, graphs}) => {
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: graphs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  const totalHeight = rowVirtualizer.getTotalSize();
  const items = rowVirtualizer.getVirtualItems();

  return (
    <>
      <Box
        border="top-and-bottom"
        style={{
          display: 'grid',
          gridTemplateColumns: '100%',
          height: '32px',
          fontSize: '12px',
          color: Colors.Gray600,
        }}
      >
        <HeaderCell>Graph</HeaderCell>
      </Box>
      <div style={{overflow: 'hidden'}}>
        <Container ref={parentRef}>
          <Inner $totalHeight={totalHeight}>
            {items.map(({index, key, size, start}) => {
              const row: Graph = graphs[index]!;
              return (
                <GraphRow
                  key={key}
                  name={row.name}
                  description={row.description}
                  path={row.path}
                  repoAddress={repoAddress}
                  height={size}
                  start={start}
                />
              );
            })}
          </Inner>
        </Container>
      </div>
    </>
  );
};

interface GraphRowProps {
  name: string;
  path: string;
  description: string | null;
  repoAddress: RepoAddress;
  height: number;
  start: number;
}

const GraphRow = (props: GraphRowProps) => {
  const {name, path, description, repoAddress, start, height} = props;

  const [queryGraph, queryResult] = useLazyQuery<SingleGraphQuery, SingleGraphQueryVariables>(
    SINGLE_GRAPH_QUERY,
    {
      variables: {
        selector: {
          repositoryName: repoAddress.name,
          repositoryLocationName: repoAddress.location,
          graphName: name,
        },
      },
    },
  );

  useDelayedRowQuery(queryGraph);
  const {data} = queryResult;

  const displayedDescription = React.useMemo(() => {
    if (description) {
      return description;
    }
    if (data?.graphOrError.__typename === 'Graph') {
      return data.graphOrError.description;
    }
    return null;
  }, [data, description]);

  return (
    <Row $height={height} $start={start}>
      <RowGrid border="bottom">
        <RowCell>
          <Box flex={{direction: 'column'}}>
            <div style={{whiteSpace: 'nowrap', fontWeight: 500}}>
              <Link to={workspacePathFromAddress(repoAddress, path)}>{name}</Link>
            </div>
            {displayedDescription ? (
              <div
                style={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <Caption
                  style={{
                    color: Colors.Gray500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayedDescription}
                </Caption>
              </div>
            ) : null}
          </Box>
        </RowCell>
      </RowGrid>
    </Row>
  );
};

const RowGrid = styled(Box)`
  display: grid;
  grid-template-columns: 100%;
  height: 100%;
`;

const SINGLE_GRAPH_QUERY = gql`
  query SingleGraphQuery($selector: GraphSelector!) {
    graphOrError(selector: $selector) {
      ... on Graph {
        id
        name
        description
      }
    }
  }
`;
