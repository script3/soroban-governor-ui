import { mockProposals, mockVotes } from "@/mock/dao";
import { Governor, Proposal, Vote } from "@/types";
import { DefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { useWallet } from "./wallet";
import governors from "../../public/governors/governors.json";
import { parseProposalFromXDR } from "@/utils/parse";
import { StrKey, nativeToScVal, xdr } from "stellar-sdk";
import { VoteCount } from "soroban-governor-js-sdk";
const apiEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT as string
const mappedGovernors = governors.map(
  ({ settings:{timelock, votePeriod, proposalThreshold, voteDelay,...settings}, ...rest }) => {
    return {
      ...rest,
      settings:{
        ...settings,
        timelock: BigInt(timelock),
      votePeriod: BigInt(votePeriod),
      proposalThreshold: BigInt(proposalThreshold),
      voteDelay: BigInt(voteDelay),
      }
    };
  }
);
const DEFAULT_STALE_TIME = 20 * 1000;
export function useGovernors(
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { data, isLoading, error } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["governors"],
    queryFn: loadGovernors,
  });
  async function loadGovernors(): Promise<Governor[]> {
    return mappedGovernors as Governor[];
  }
  return {
    governors: data as Governor[],
    isLoading,
    error,
  };
}

export function useGovernor(
  governorId: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { data, isLoading, error } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["governor", governorId],
    queryFn: () => getGovernorById(governorId),
  });
  async function getGovernorById(governorId: string) {
    const foundGovernor = mappedGovernors.find((p) => p.address === governorId);
    return foundGovernor || null;
  }

  return {
    governor: data as Governor,
    isLoading,
    error,
  };
}

export function useProposals(
  daoId: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { data, isLoading, error } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["proposals", daoId],
    queryFn: () => loadProposalsByDaoId(daoId),
  });
  async function loadProposalsByDaoId(daoId: string): Promise<Proposal[]> {
    // return mockProposals.filter((p) => p.contract_id === daoId);
    return mockProposals as any
  }
  return {
    proposals: data as Proposal[],
    isLoading,
    error,
  };
}



export function useProposal(
  proposalId: number,
  governorAddress: string,
  voteDelay: bigint,
  votePeriod: bigint,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const {getTotalVotesByProposal} = useWallet()
  const {
    data: proposal,
    isLoading,
    error,
  } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["proposal", proposalId],
    queryFn: async ()=>{
      return await getProposalByIdWithVoteCount(proposalId,governorAddress,voteDelay,votePeriod)
    },
  });
  async function getProposalByIdWithVoteCount(proposalId: number, governorAddress: string, voteDelay: bigint, votePeriod: bigint) {

    const data = await getProposalById(proposalId,governorAddress,voteDelay,votePeriod)
    if(!data){
      return null
    }

  // get proposal votes from contract 
  const voteCount = await getTotalVotesByProposal(proposalId,governorAddress) as VoteCount

  if(voteCount?._for  ){
    data.votes_for = Number(voteCount._for)
    data.total_votes = Number(voteCount._for + voteCount.against + voteCount.abstain)
    data.votes_abstain = Number(voteCount.abstain)
    data.votes_against = Number(voteCount.against)
  }
  console.log({data})
  return data

  // return mockProposals.find((p) => p.id === proposalId);
  
  }

  return {
    proposal: proposal as Proposal,
    isLoading,
    error,
  };
}

export function useVotes(
  proposalId: number,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const {
    data: votes,
    isLoading,
    error,
  } = useQuery({
    staleTime: DEFAULT_STALE_TIME,
    ...options,
    queryKey: ["votes", proposalId],
    queryFn: () => getVotesByProposalId(proposalId),
  });
  async function getVotesByProposalId(proposalId: number) {
    return mockVotes.filter((p) => p.proposal_id === proposalId);
  }

  return {
    votes: votes as Vote[],
    isLoading,
    error,
  };
}

export function useVoteTokenBalance(
  voteTokenAddress: string,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getVoteTokenBalance, connected } = useWallet();
  const { data, isLoading, error } = useQuery({
    ...options,
    staleTime: DEFAULT_STALE_TIME,
    queryKey: ["voteTokenBalance", voteTokenAddress, connected],
    queryFn: async () => {
      const result = await getVoteTokenBalance(voteTokenAddress, true);
      return result || BigInt(0);
    },
  });
  return {
    balance: data as bigint,
    isLoading,
    error,
  };
}

export function useVotingPowerByProposal(
  voteTokenAddress: string,
  proposalStartTime: number,
  proposalId: number,
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getVotingPowerByProposal, connected } = useWallet();
  const { data, isLoading, error } = useQuery({
    ...options,
    staleTime: DEFAULT_STALE_TIME,
    queryKey: [
      "votingPowerByProposal",
      proposalId,
      proposalStartTime,
      connected,
    ],
    queryFn: async () => {
      const result = await getVotingPowerByProposal(
        voteTokenAddress,
        proposalStartTime,
        true
      );
      return result || BigInt(0);
    },
  });
  return {
    votingPower: data as bigint,
    isLoading,
    error,
  };
}

export function useUserVoteByProposalId(
  proposalId: number,
  governorAddress: string,
 
  options: Partial<DefinedInitialDataOptions> = {} as any
) {
  const { getUserVoteByProposalId, connected } = useWallet();
  const { data, isLoading, error } = useQuery({
    ...options,
    staleTime: DEFAULT_STALE_TIME,

    queryKey: ["userVoteByProposalId", proposalId, connected],
    queryFn: async () => {
      const result = await getUserVoteByProposalId(
        proposalId,
        governorAddress,
        true
      );
      return result || null;
    },
  });
  return {
    userVote: data as bigint,
    isLoading,
    error,
  };
}


async function getProposalById(proposalId:number,governorAddress:string,voteDelay:bigint,votePeriod:bigint){
 try{
const addressHash = StrKey.decodeContract(governorAddress).toString("base64")

  const proposalNum =   nativeToScVal(proposalId,{type:"u32"}).toXDR("base64")
  console.log({addressHash,proposalNum,governorAddress})
   const data = await runGraphQLQuery(`query getProposalsById { 
     zephyrdd496Ee27D82Df60346728B50260Ed26Sbycontractandproposalnum(hash: "${addressHash}", num: "${proposalNum}") { nodes {
     contract
     propNum
     title
     descr
     action
     creator
     status
     ledger
   }
   }
   }`,"getProposalsById")
  if(!data){
    return null
  }
   const proposal = data["zephyrdd496Ee27D82Df60346728B50260Ed26Sbycontractandproposalnum"]?.nodes[0]
  return parseProposalFromXDR(proposal,voteDelay,votePeriod)

 }catch(e){
    console.error(e)
    return null
  
 }
}



 async function runGraphQLQuery(queryString:string,operationName:string){
  try{
    const res = await fetch(apiEndpoint, {
    cache: "no-cache",
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
  body: JSON.stringify({
    operationName,
    query: queryString})
})
    const json_res = await res.json();
    const data = json_res.data;
    return data
  }
  catch(e){
    console.log("error on fetch")
    console.error(e)
    return null
  }
}