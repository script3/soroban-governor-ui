import { ProposalStatusEnum } from "@/constants";

export function getStatusByProposalState(statusFromContract:ProposalStatusEnum,voteStart:number,voteEnd:number,currentBlock:number){
    if(statusFromContract === undefined && statusFromContract === null){
        return statusFromContract
    }

    if(statusFromContract === ProposalStatusEnum.Open){
        if(voteStart<currentBlock && voteEnd>currentBlock){
            return ProposalStatusEnum.Active
        }
        if(voteStart > currentBlock){
            return ProposalStatusEnum.Pending
        }
        return ProposalStatusEnum.Open
    }

    return statusFromContract
}
