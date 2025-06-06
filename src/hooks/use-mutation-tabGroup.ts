import { api } from "../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { toast } from "sonner";

//use for tabGroup creation, deletion
// and updating (tabGroup update, add tab, remove tab)

export function useMutationTabGroup() {
  const updateMutation = useSessionMutation(api.tabGroups.update);
  const deleteMutation = useSessionMutation(api.tabGroups.remove);
  const addTabMutation = useSessionMutation(api.tabGroups.addTabToGroup);
  const removeTabMutation = useSessionMutation(api.tabGroups.removeTabFromGroup);

  const editTabGroup = async (tabGroupId: Id<"tabGroups">, name: string, description?: string): Promise<boolean> => {
    try {
      await updateMutation({
        tabGroupId,
        name,
        description
      });
      return true;
    } catch (error) {
      toast((error as Error).message || "Please try again later");
      return false;
    }
  };

  const deleteTabGroup = async (tabGroupId: Id<"tabGroups">): Promise<boolean> => {
    try {
      await deleteMutation({
        tabGroupId
      });
      return true;
    } catch (error) {
      toast((error as Error).message || "Please try again later");
      return false;
    }
  };

  const addTab = async (tabId: Id<"tabs">, tabGroupId: Id<"tabGroups">): Promise<boolean> => {
    try {
      await addTabMutation({
        tabId,
        tabGroupId
      });
      return true;
    } catch (error) {
      toast((error as Error).message || "Please try again later");
      return false;
    }
  };

  const removeTab = async (tabId: Id<"tabs">, tabGroupId: Id<"tabGroups">): Promise<boolean> => {
    try {
      await removeTabMutation({
        tabId,
        tabGroupId
      });
      return true;
    } catch (error) {
      toast((error as Error).message || "Please try again later");
      return false;
    }
  };

  return {
    edit: editTabGroup,
    delete: deleteTabGroup,
    addTab,
    removeTab
  };
}

export function useMutationTabGroups() {
  const createMutation = useSessionMutation(api.tabGroups.create);

  const createTabGroup = async (name: string, description?: string): Promise<Id<"tabGroups"> | null> => {
    try {
      const tabGroupId = await createMutation({
        name,
        description
      });
      return tabGroupId;
    } catch (error) {
      toast((error as Error).message || "Please try again later");
      return null;
    }
  };

  return {
    create: createTabGroup
  };
}