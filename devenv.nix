# Docs: https://devenv.sh/basics/
{ pkgs, ... }: {

  languages = {
    # Docs: https://devenv.sh/languages/
    nix.enable = true;
    javascript = {
      enable = true; # source: https://github.com/cachix/devenv/blob/main/src/modules/languages/javascript.nix
      #corepack.enable = true; # shim for npm/yarn/pnpm - https://github.com/nodejs/corepack#readme
      #- but questionable: https://github.com/cachix/devenv/pull/475#issuecomment-1571879078
    };
  };

  packages = with pkgs; [
    # Search for packages: https://search.nixos.org/packages?channel=unstable&query=cowsay
    # (note: this searches on unstable channel, be aware your nixpkgs flake input might be on a release channel)
    gcc # needed for some npm packages

    # remove whichever you don't need
    yarn
    nodePackages.pnpm
  ];

  scripts = {
    # Docs: https://devenv.sh/scripts/
    # yd.exec = ''yarn dev'';
  };

  difftastic.enable = true; # https://devenv.sh/integrations/difftastic/

  pre-commit.hooks = {
    # Docs: https://devenv.sh/pre-commit-hooks/
    # available pre-configured hooks: https://devenv.sh/reference/options/#pre-commithooks
    # adding hooks which are not included: https://github.com/cachix/pre-commit-hooks.nix/issues/31

    nil.enable = true; # nix check
    nixpkgs-fmt.enable = true; # nix formatting
    eslint = {
      enable = true;
      fail_fast = true; # skip other pre-commit hooks if this one fails
    };
  };
}
