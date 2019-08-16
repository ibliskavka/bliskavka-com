aws cloudformation deploy^
    --template-file ./Aws/CloudFormation/Hosting/stack-template.yml^
    --stack-name bliskavka-com-stack^
    --tags^
        Client=Bliskavka^
        Project=Home^
        Environment=Production